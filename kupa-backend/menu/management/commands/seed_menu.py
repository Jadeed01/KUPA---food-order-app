from urllib.parse import quote_plus

from django.core.management.base import BaseCommand

from menu.models import Category, Food, Option, OptionGroup

CATEGORIES = ["Soup", "Seafood", "Rice Bowls", "Noodles"]

# name, category, cuisine, price, featured, top_of_week
FOODS = [
    ("Squid Sweet & Sour Salad", "Seafood", "Japanese food", "19.99", True, True),
    ("Black Pepper Beef Lumpia", "Rice Bowls", "Filipino food", "27.12", True, False),
    ("Japan Hainanese Sashimi", "Seafood", "Japanese food", "39.99", True, True),
    ("Hongkong Hainanese Rice", "Rice Bowls", "Chinese food", "14.99", False, True),
    ("Hot & Spicy Corn Soup", "Soup", "Chinese food", "20.99", True, False),
    ("Singapore Hainanese Rice", "Rice Bowls", "Singaporean food", "24.99", False, True),
    ("Chicken Teriyaki", "Rice Bowls", "Japanese food", "18.50", True, False),
    ("Miso Ramen", "Noodles", "Japanese food", "16.75", False, False),
    ("Seafood Tom Yum", "Soup", "Thai food", "21.40", False, True),
    ("Garlic Butter Prawns", "Seafood", "Western food", "26.90", True, False),
]

SAUCES = [("Teriyaki", "0"), ("Yakiniku", "0")]
TOPPINGS = [("Omelet", "2"), ("Sausage", "3"), ("Cheese", "5")]


class Command(BaseCommand):
    help = "Seed categories, foods and options with dummy data"

    def handle(self, *args, **options):
        cats = {}
        for i, name in enumerate(CATEGORIES):
            cat, _ = Category.objects.get_or_create(name=name, defaults={"order": i})
            cats[name] = cat

        for name, cat, cuisine, price, featured, top in FOODS:
            placeholder = f"https://placehold.co/600x600/2f7a50/ffffff/png?text={quote_plus(name)}"
            food, _ = Food.objects.update_or_create(
                name=name,
                defaults={
                    "category": cats[cat],
                    "cuisine": cuisine,
                    "description": f"{name} - freshly prepared and delivered hot to your door.",
                    "price": price,
                    "image_url": placeholder,
                    "is_featured": featured,
                    "is_top_of_week": top,
                },
            )

            sauce, _ = OptionGroup.objects.get_or_create(
                food=food, name="Sauce", defaults={"is_required": True, "max_select": 1, "order": 0}
            )
            for n, p in SAUCES:
                Option.objects.get_or_create(group=sauce, name=n, defaults={"extra_price": p})

            top_group, _ = OptionGroup.objects.get_or_create(
                food=food, name="Add a Topping?", defaults={"is_required": False, "max_select": 3, "order": 1}
            )
            for n, p in TOPPINGS:
                Option.objects.get_or_create(group=top_group, name=n, defaults={"extra_price": p})

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(CATEGORIES)} categories and {len(FOODS)} foods."))