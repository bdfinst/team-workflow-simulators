Feature: WIP Simulation Engine
  As a user exploring workflow patterns
  I want to run a simulation of work items flowing through process steps
  So that I can see how WIP limits affect throughput and lead time

  Background:
    Given a pipeline with the following steps:
      | name        | processTime |
      | Development | 4           |
      | Code Review | 2           |
      | Testing     | 3           |
      | Deployment  | 1           |
    And 20 work items to process

  Scenario: Work items flow through all steps to completion
    Given no WIP limits are set
    When I run the simulation to completion
    Then all 20 work items should be completed
    And each item should have passed through all 4 steps

  Scenario: WIP limits block upstream steps
    Given a WIP limit of 3 per step
    When the "Code Review" step has 3 items in progress
    And a "Development" item finishes
    Then the finished item should wait in the "Code Review" queue
    And the "Code Review" in-progress count should not exceed 3

  Scenario: Items without WIP limits accumulate freely
    Given no WIP limits are set
    When I run the simulation for 20 ticks
    Then the total WIP count should be greater than with a WIP limit of 3

  Scenario: Queue depth grows without WIP limits
    Given no WIP limits are set
    When I run the simulation for 30 ticks
    Then at least one step should have a queue depth greater than 5

  Scenario: WIP limits keep queues shallow
    Given a WIP limit of 3 per step
    When I run the simulation for 30 ticks
    Then no step should have a queue depth greater than 5

  Scenario: Process time variability affects item duration
    Given a process time spread of 30%
    When I run the simulation to completion
    Then not all items should have the same lead time
