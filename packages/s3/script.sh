bash +o history
mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
bash -o history

mc admin info myminio
mc ls myminio
mc mb myminio/$S3_BUCKET || true
mc admin user add myminio $S3_ACCESS_KEY $S3_SECRET_KEY || true
mc admin policy attach myminio readwrite --user $S3_ACCESS_KEY || true
