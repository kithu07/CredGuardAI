from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    @abstractmethod
    def run(self, input_data: Any) -> Dict[str, Any]:
        pass
