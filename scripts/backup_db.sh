#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/uppskriftabok_${TIMESTAMP}.sql.gz"
LOG_FILE="$BACKUP_DIR/backup.log"
KEEP_DAYS=30

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "Starting backup"

if ! docker compose -f "$PROJECT_DIR/docker-compose.yml" ps postgres | grep -q "running"; then
    log "ERROR: postgres container is not running"
    exit 1
fi

docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T postgres \
    pg_dump -U uppskriftabok uppskriftabok | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
log "Backup written: $BACKUP_FILE ($SIZE)"

find "$BACKUP_DIR" -name "uppskriftabok_*.sql.gz" -mtime "+${KEEP_DAYS}" -delete
log "Pruned backups older than ${KEEP_DAYS} days"

log "Done"
