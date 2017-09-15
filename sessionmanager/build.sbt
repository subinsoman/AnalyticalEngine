// Copyright (c) 2016, CodiLime Inc.

import com.typesafe.sbt.packager.docker._

name := "deepsense-sessionmanager"

libraryDependencies ++= Dependencies.sessionmanager
resolvers ++= Dependencies.resolvers

Revolver.settings

enablePlugins(JavaAppPackaging, GitVersioning, DeepsenseUniversalSettingsPlugin)

// TODO Use sbt assembly to create jar.
//   NOTE: Python path in application.conf needs to be set to /opt/conda/bin/python
//   It might require manual change prop pythoncaretaker.python-binary in application.conf in JAR.
// TODO Introduce new sbt task to generate we-deps.zip

dockerBaseImage := "quay.io/deepsense_io/deepsense-spark:1.6.1"
dockerExposedPorts := Seq(9082)
dockerCommands ++= Seq(
  Cmd("USER", "root"),
  ExecCmd("ENTRYPOINT", "/opt/startup.sh"),
  ExecCmd("CMD", "bin/deepsense-sessionmanager")
)
dockerUpdateLatest := true
