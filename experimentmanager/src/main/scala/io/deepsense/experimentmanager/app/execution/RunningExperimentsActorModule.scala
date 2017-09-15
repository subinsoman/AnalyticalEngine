/**
 * Copyright (c) 2015, CodiLime Inc.
 *
 * Owner: Wojciech Jurczyk
 */

package io.deepsense.experimentmanager.app.execution

import akka.actor.{ActorRef, ActorSystem}
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides, Singleton}

import io.deepsense.experimentmanager.akka.GuiceAkkaExtension

class RunningExperimentsActorModule extends AbstractModule {
  override def configure(): Unit = {
  }

  @Provides
  @Singleton
  @Named("RunningExperimentsActor")
  def provideRunningExperimentsActorRef(system: ActorSystem): ActorRef = {
    system.actorOf(GuiceAkkaExtension(system).props[RunningExperimentsActor])
  }
}
