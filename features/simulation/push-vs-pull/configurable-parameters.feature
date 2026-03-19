Feature: Push vs Pull Configurable Parameters
  As a user experimenting with sprint settings
  I want to adjust simulation parameters
  So that I can explore how different configurations affect push vs pull outcomes

  Background:
    Given I am on the Push vs Pull simulator page

  Scenario: Adjust sprint length in days
    When I set the sprint length to 15 days
    And I run the simulation to sprint end
    Then the simulation should stop at day 15
    And the sprint progress bar should show "Day 15 of 15" at completion

  Scenario: Adjust push review check frequency
    When I set the push review check interval to 3 days
    Then push team members should only check for reviews every 3 days
    And reviews should accumulate longer in the push review queue

  Scenario: Adjust push review duration
    When I increase the push review duration
    Then reviews in the push model should take longer to complete
    And this should increase the push team's average lead time

  Scenario: Adjust pull task size
    When I increase the pull model dev time
    Then pull team members should take longer to code each item
    And fewer items should be completed by sprint end

  Scenario: Change simulation speed
    When I set the simulation speed to 2x
    Then the simulation should run at double speed

  Scenario: Parameters have sensible defaults
    Then the sprint length should default to 10 days
    And the team size should default to 5
    And the simulation speed should default to 1x

  Scenario: Parameters cannot be changed while running
    When I start the simulation
    Then parameter controls should be disabled
    When I pause the simulation
    Then parameter controls should be enabled again

  Scenario: Reset applies new parameter values
    When I change the sprint length to 15 days
    And I press reset
    Then the simulation should be configured for a 15-day sprint
