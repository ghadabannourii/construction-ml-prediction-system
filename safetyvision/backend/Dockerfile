FROM python:3.10-slim

WORKDIR /app

# Installer les dépendances système pour OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY app/ ./app/
COPY model/ ./model/

# Exposer le port
EXPOSE 8001

# Lancer l'API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
