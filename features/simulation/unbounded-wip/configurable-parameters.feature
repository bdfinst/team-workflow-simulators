Feature: Configurable Parameters
  As a user experimenting with workflow settings
  I want to adjust simulation parameters
  So that I can explore how different configurations affect outcomes

  Background:
    Given I am on the Unbounded WIP simulator page

  Scenario: Adjust WIP limit per step
    When I set the WIP limit to 2
    Then the WIP-limited pipeline should enforce a limit of 2 per step

  Scenario: Change work item count
    When I set the work item count to 10
    And I run the simulation to completion
    Then both pipelines should have completed 10 items

  Scenario: Adjust process time variability
    When I set the process time spread to 0%
    And I run the simulation to completion
    Then all items should have similar lead times

  Scenario: Change simulation speed
    When I set the simulation speed to 2x
    Then the simulation should run at double speed

  Scenario: Adjust arrival rate
    When I set the arrival rate to 2 items per tick
    And I run the simulation for 10 ticks
    Then at least 15 items should have entered the pipeline

  Scenario: Parameters have sensible defaults
    Then the WIP limit should default to 3
    And the work item count should default to 20
    And the process time spread should default to 30%
    And the simulation speed should default to 1x
    And the arrival rate should default to 1 per tick
