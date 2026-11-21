from rest_framework import serializers

from menu.models import Option


def food_image(food, request=None):
    if food is None:
        return None
    if food.image:
        return request.build_absolute_uri(food.image.url) if request else food.image.url
    return food.image_url or None


def resolve_options(food, option_ids):
    """Validate picked options against the food's option groups rules."""
    ids = set(option_ids)
    options = list(Option.objects.filter(id__in=ids, group__food=food).select_related("group"))
    if len(options) != len(ids):
        raise serializers.ValidationError({"option_ids": "One or more options are invalid for this food."})

    by_group = {}
    for o in options:
        by_group.setdefault(o.group_id, []).append(o)

    for group in food.option_groups.all():
        picked = len(by_group.get(group.id, []))
        if group.is_required and picked == 0:
            raise serializers.ValidationError({"option_ids": f'Please choose an option for "{group.name}".'})
        if picked > group.max_select:
            raise serializers.ValidationError(
                {"option_ids": f'"{group.name}" allows at most {group.max_select}.'}
            )
    return options