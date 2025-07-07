from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.order import Order
from app.models.product import Product
from app.models.category import Category
from app.models.payment import Payment
from app.utils.auth import get_current_admin_user
import pandas as pd
from io import BytesIO
from app.schemas.user import User

router = APIRouter(tags=["reports"])

@router.get("/reports")
async def get_report_data(
    time_range: str = "7d",
    current_user: dict = Depends(get_current_admin_user)
):
    try:
        # Calculate start date based on time range
        if time_range == "7d":
            start_date = datetime.now() - timedelta(days=7)
        elif time_range == "30d":
            start_date = datetime.now() - timedelta(days=30)
        elif time_range == "90d":
            start_date = datetime.now() - timedelta(days=90)
        elif time_range == "1y":
            start_date = datetime.now() - timedelta(days=365)
        else:
            start_date = datetime.now() - timedelta(days=7)

        # Get sales data
        orders = await Order.find({
            "created_at": {"$gte": start_date},
            "status": {"$in": ["completed", "delivered"]}
        }).to_list()

        # Calculate daily sales data
        sales_data = {}
        for order in orders:
            date = order.created_at.strftime("%Y-%m-%d")
            if date not in sales_data:
                sales_data[date] = {"revenue": 0, "orders": 0}
            sales_data[date]["revenue"] += order.total_price
            sales_data[date]["orders"] += 1

        # Convert to list format
        sales_data_list = [
            {"date": date, "revenue": data["revenue"], "orders": data["orders"]}
            for date, data in sales_data.items()
        ]

        # Get top products
        top_products = {}
        for order in orders:
            for item in order.items:
                if item.product_id not in top_products:
                    top_products[item.product_id] = {
                        "name": item.product_id,  # We'll update this with actual product name
                        "sales": 0,
                        "revenue": 0
                    }
                top_products[item.product_id]["sales"] += item.quantity
                top_products[item.product_id]["revenue"] += item.price * item.quantity

        # Get product names
        product_ids = list(top_products.keys())
        products = await Product.find({"_id": {"$in": product_ids}}).to_list()
        product_names = {str(p.id): p.name for p in products}

        # Update product names and convert to list
        top_products_list = []
        for product_id, data in top_products.items():
            data["name"] = product_names.get(product_id, "Unknown Product")
            top_products_list.append(data)

        # Sort by revenue and get top 10
        top_products_list.sort(key=lambda x: x["revenue"], reverse=True)
        top_products_list = top_products_list[:10]

        # Get category distribution
        categories = await Category.find_all().to_list()
        category_distribution = []
        for category in categories:
            products_count = await Product.find({"category_id": str(category.id)}).count()
            category_distribution.append({
                "category": category.name,
                "value": products_count
            })

        # Get payment methods distribution
        payments = await Payment.find({"created_at": {"$gte": start_date}}).to_list()
        payment_methods = {}
        for payment in payments:
            if payment.method not in payment_methods:
                payment_methods[payment.method] = 0
            payment_methods[payment.method] += 1

        payment_methods_list = [
            {"method": method, "value": count}
            for method, count in payment_methods.items()
        ]

        # Calculate totals
        total_revenue = sum(order.total_price for order in orders)
        total_orders = len(orders)
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        return {
            "sales_data": sales_data_list,
            "top_products": top_products_list,
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_order_value": average_order_value,
            "category_distribution": category_distribution,
            "payment_methods": payment_methods_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/export")
async def export_report(
    format_type: str = "csv",
    time_range: str = "7d",
    current_user: dict = Depends(get_current_admin_user)
):
    try:
        # Get report data
        report_data = await get_report_data(time_range, current_user)

        if format_type == "csv":
            # Create CSV
            df = pd.DataFrame(report_data["sales_data"])
            output = BytesIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return StreamingResponse(
                output,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=report-{time_range}.csv"
                }
            )
        elif format_type == "pdf":
            # Create PDF (you'll need to implement PDF generation)
            # This is a placeholder
            raise HTTPException(status_code=501, detail="PDF export not implemented yet")
        else:
            raise HTTPException(status_code=400, detail="Invalid export format")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 