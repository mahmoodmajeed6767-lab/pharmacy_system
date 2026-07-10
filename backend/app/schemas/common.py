from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel):
    status: str = "success"
    data: List
    total: int
    page: int
    limit: int
    total_pages: int


class MessageResponse(BaseModel):
    status: str = "success"
    message: str
    data: dict | None = None


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    data: None = None
