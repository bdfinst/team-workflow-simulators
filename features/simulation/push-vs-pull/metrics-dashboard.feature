Feature: Push vs Pull Metrics Dashboard
  As a user observing a sprint simulation
  I want to see real-time metrics for both teams
  So that I can quantify the impact of push vs pull work models

  Background:
    Given I am on the Push vs Pull simulator page

  Scenario: Metrics dashboard displays all key metrics
    Then I should see the following metrics for each team:
      | metric              |
      | Items Completed     |
      | Items In Progress   |
      | Avg Lead Time       |
      | Throughput          |
      | Flow Efficiency     |
    And I should see the review queue depth for each team

  Scenario: Sprint progress bar shows current day
    When I start the simulation
    And the simulation reaches day 3
    Then the sprint progress bar should show "Day 3 of 10"

  Scenario: Metrics update as simulation runs
    When I start the simulation
    And I wait for 2 days of simulation time
    Then the metrics should have changed from their initial values

  Scenario: Lead time is displayed in days
    When I run the simulation until items are completed
    Then the average lead time should be shown in days (e.g., "2.5 days")
    And it should not display raw tick counts

  Scenario: Throughput reflects items completed per day
    When I run the simulation to sprint end
    Then the throughput should equal items completed divided by sprint days
    And throughput should be displayed as "X items/day"

  Scenario: Items in progress shown as waste at sprint end
    When I run the simulation to sprint end
    Then the "Items In Progress" metric should highlight waste for the push team
    And the push team should show more items in progress than the pull team

  Scenario: Metrics highlight which team performs better
    When I run the simulation to sprint end
    Then the pull team metrics should be highlighted as better
    And the push team metrics should be highlighted as worse
