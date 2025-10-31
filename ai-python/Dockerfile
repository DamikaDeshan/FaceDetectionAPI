FROM python:3.11-slim
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DEFAULT_TIMEOUT=120

COPY requirements.txt ./

# upgrade pip and install with retries to avoid transient network timeouts
RUN python -m pip install --upgrade pip setuptools wheel \
 && for i in 1 2 3; do \
      pip install --no-cache-dir --disable-pip-version-check -r requirements.txt && break || sleep 10; \
    done

COPY app ./app
EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]

