import yfinance as yf
from typing import Dict, Any

class AssetPriceService:
    @staticmethod
    def get_live_rates() -> Dict[str, Any]:
        """
        Fetches live rates for Gold and Silver.
        Returns price per Gram in INR.
        """
        rates = {
            "Gold": {"rate": 7200.0, "unit": "gram", "currency": "INR", "source": "static_fallback"},
            "Silver": {"rate": 90.0, "unit": "gram", "currency": "INR", "source": "static_fallback"}
        }

        try:
            # Fetch Gold (GC=F), Silver (SI=F) and USDINR (INR=X or DX-Y.NYB.. tricky, let's use INR=X)
            # correct ticker for USD to INR is "INR=X" ? No, "INR=X" usually is 1 USD in INR.
            tickers = yf.Tickers("GC=F SI=F INR=X")
            
            # 1 Troy Ounce = 31.1035 grams
            OZ_TO_GRAM = 31.1034768
            
            usd_inr = tickers.tickers["INR=X"].history(period="1d")['Close'].iloc[-1]
            
            # Gold
            gold_usd_oz = tickers.tickers["GC=F"].history(period="1d")['Close'].iloc[-1]
            gold_inr_gram = (gold_usd_oz / OZ_TO_GRAM) * usd_inr
            
            # Silver
            silver_usd_oz = tickers.tickers["SI=F"].history(period="1d")['Close'].iloc[-1]
            silver_inr_gram = (silver_usd_oz / OZ_TO_GRAM) * usd_inr
            
            rates["Gold"] = {
                "rate": round(gold_inr_gram, 2),
                "unit": "gram",
                "currency": "INR",
                "source": "live"
            }
            
            rates["Silver"] = {
                "rate": round(silver_inr_gram, 2),
                "unit": "gram",
                "currency": "INR",
                "source": "live"
            }
            
        except Exception as e:
            print(f"Error fetching live rates: {e}")
            # Keep fallback values
            
        return rates
