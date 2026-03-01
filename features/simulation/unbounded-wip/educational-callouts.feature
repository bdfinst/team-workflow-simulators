Feature: Educational Callouts
  As a user learning about workflow patterns
  I want to see explanations of key concepts
  So that I understand why WIP limits matter

  Background:
    Given I am on the Unbounded WIP simulator page

  Scenario: Little's Law explanation is available
    Then I should see an educational callout about "Little's Law"
    And it should explain the relationship between WIP, throughput, and lead time

  Scenario: Context-switching callout appears during high WIP
    When the unbounded pipeline WIP count exceeds 8
    Then I should see a callout about context-switching cost

  Scenario: Pull vs push explanation is available
    Then I should see an educational callout about "Pull vs. Push"
    And it should explain how WIP limits create a pull system

  Scenario: Swarming callout appears when workers are blocked
    When a worker in the WIP-limited pipeline is blocked by the WIP limit
    Then I should see a callout about swarming
