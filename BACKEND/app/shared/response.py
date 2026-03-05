from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any
T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: Optional[T] = None

