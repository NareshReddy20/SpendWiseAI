from pydantic import BaseModel


class ReportFilterSchema(BaseModel):
    month: int
    year: int