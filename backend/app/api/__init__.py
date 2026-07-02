from app.api.analysis import router as analysis_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.report import router as report_router
from app.api.stock import router as stock_router
from app.api.system import router as system_router

routers = [
    analysis_router,
    chat_router,
    documents_router,
    report_router,
    stock_router,
    system_router,
]
