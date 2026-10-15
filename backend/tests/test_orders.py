"""Tests for order creation with an in-memory fake database (no MongoDB needed)."""
import asyncio
from types import SimpleNamespace

import pytest
from bson import ObjectId
from fastapi import HTTPException

from app.routes import orders as orders_module
from app.schemas.order import OrderCreate


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeProducts:
    def __init__(self, products):
        self.docs = {product["_id"]: dict(product) for product in products}

    async def find_one(self, query):
        doc = self.docs.get(query["_id"])
        return dict(doc) if doc else None

    async def update_one(self, query, update):
        self.docs[query["_id"]]["stock"] += update["$inc"]["stock"]


class FakeOrders:
    def __init__(self):
        self.docs = {}

    async def insert_one(self, doc):
        inserted_id = ObjectId()
        self.docs[inserted_id] = {**doc, "_id": inserted_id}
        return FakeInsertResult(inserted_id)

    async def find_one(self, query):
        doc = self.docs.get(query["_id"])
        return dict(doc) if doc else None


class FakeCarts:
    def __init__(self):
        self.deleted = []

    async def delete_one(self, query):
        self.deleted.append(query)


class FakeDB:
    def __init__(self, products):
        self.products = FakeProducts(products)
        self.orders = FakeOrders()
        self.carts = FakeCarts()


LIPSTICK_ID = ObjectId()
CREAM_ID = ObjectId()


@pytest.fixture
def db(monkeypatch):
    fake = FakeDB([
        {"_id": LIPSTICK_ID, "name": "Lipstick", "price": 150000.0, "stock": 10},
        {"_id": CREAM_ID, "name": "Cream", "price": 99000.0, "stock": 5},
    ])
    monkeypatch.setattr(orders_module, "get_database", lambda: fake)
    return fake


def make_order(items, total_price=1.0, status="delivered"):
    return OrderCreate(
        user_id="client-supplied-user-id",
        items=items,
        total_price=total_price,
        shipping_address="1 Test Street",
        phone_number="0900000000",
        status=status,
    )


def place(order):
    user = SimpleNamespace(id=ObjectId())
    return asyncio.run(orders_module.create_order(order=order, current_user=user))


def test_total_and_item_prices_are_recomputed_from_the_database(db):
    order = make_order(
        items=[
            {"product_id": str(LIPSTICK_ID), "product_name": "x", "quantity": 2, "price": 1.0},
            {"product_id": str(CREAM_ID), "product_name": "y", "quantity": 1, "price": 1.0},
        ],
        total_price=1.0,
        status="delivered",
    )

    created = place(order)

    expected_total = 150000.0 * 2 + 99000.0 * 1 + orders_module.SHIPPING_FEE
    assert created.total_price == expected_total
    assert [item.price for item in created.items] == [150000.0, 99000.0]
    assert [item.product_name for item in created.items] == ["Lipstick", "Cream"]
    assert created.status == "pending"

    stored = next(iter(db.orders.docs.values()))
    assert stored["total_price"] == expected_total
    assert stored["status"] == "pending"
    assert [item["price"] for item in stored["items"]] == [150000.0, 99000.0]

    # Stock is still decremented as before
    assert db.products.docs[LIPSTICK_ID]["stock"] == 8
    assert db.products.docs[CREAM_ID]["stock"] == 4


@pytest.mark.parametrize("quantity", [0, -1])
def test_quantity_below_one_is_rejected(db, quantity):
    order = make_order(
        items=[{"product_id": str(LIPSTICK_ID), "product_name": "x", "quantity": quantity, "price": 1.0}],
    )

    with pytest.raises(HTTPException) as exc_info:
        place(order)

    assert exc_info.value.status_code == 400
    assert db.orders.docs == {}
    assert db.products.docs[LIPSTICK_ID]["stock"] == 10


def test_empty_order_is_rejected(db):
    with pytest.raises(HTTPException) as exc_info:
        place(make_order(items=[]))

    assert exc_info.value.status_code == 400
    assert db.orders.docs == {}


def test_unknown_product_is_rejected(db):
    order = make_order(
        items=[{"product_id": str(ObjectId()), "product_name": "x", "quantity": 1, "price": 1.0}],
    )

    with pytest.raises(HTTPException) as exc_info:
        place(order)

    assert exc_info.value.status_code == 404
    assert db.orders.docs == {}
