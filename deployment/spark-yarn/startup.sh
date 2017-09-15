#!/bin/bash

# Copyright (c) 2016, CodiLime Inc.

/etc/bootstrap.sh

echo "spark.yarn.appMasterEnv.PYSPARK_PYTHON /opt/conda/bin/python" >> /usr/local/spark/conf/spark-defaults.conf
echo "spark.master yarn-cluster" >> /usr/local/spark/conf/spark-defaults.conf

# Do not stop the container when script exits - run sshd instead
service sshd stop
/usr/sbin/sshd -D -d
