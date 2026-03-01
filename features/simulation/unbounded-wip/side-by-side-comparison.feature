Feature: Side-by-Side Comparison
  As a user learning about WIP limits
  I want to see unbounded and WIP-limited pipelines running simultaneously
  So that I can directly compare their behavior and outcomes

  Background:
    Given I am on the Unbounded WIP simulator page

  Scenario: Both pipelines are visible
    Then I should see two pipelines side by side
    And the left pipeline should be labeled "No WIP Limit"
    And the right pipeline should be labeled "WIP-Limited"

  Scenario: Both pipelines process the same work items
    When I start the simulation
    Then both pipelines should process the same number of work items
    And both pipelines should have the same process steps

  Scenario: WIP-limited pipeline finishes with lower lead time
    When I run the simulation to completion
    Then the WIP-limited pipeline should have a lower average lead time
    And the WIP-limited pipeline should have higher flow efficiency

  Scenario: Unbounded pipeline shows higher WIP during simulation
    When I run the simulation for 20 ticks
    Then the unbounded pipeline should have a higher WIP count
    And the unbounded pipeline should have deeper queues
