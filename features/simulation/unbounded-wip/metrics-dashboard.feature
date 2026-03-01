Feature: Live Metrics Dashboard
  As a user observing a simulation
  I want to see real-time metrics for both pipelines
  So that I can quantify the impact of WIP limits

  Background:
    Given I am on the Unbounded WIP simulator page

  Scenario: Metrics dashboard displays all key metrics
    Then I should see the following metrics for each pipeline:
      | metric          |
      | WIP Count       |
      | Avg Lead Time   |
      | Throughput       |
      | Flow Efficiency  |
      | Items Completed  |
    And I should see queue depth for each step

  Scenario: Metrics update as simulation runs
    When I start the simulation
    And I wait for 10 ticks
    Then the metrics should have changed from their initial values

  Scenario: Flow efficiency is calculated correctly
    Given a pipeline where total process time is 10 minutes
    And total lead time is 40 minutes
    When I view the metrics dashboard
    Then the flow efficiency should show "25%"

  Scenario: Throughput reflects completed items over time
    When I run the simulation to completion
    Then the throughput should equal items completed divided by total ticks

  Scenario: Metrics highlight which pipeline performs better
    When I run the simulation to completion
    Then the WIP-limited pipeline metrics should be highlighted as better
    And the unbounded pipeline metrics should be highlighted as worse
