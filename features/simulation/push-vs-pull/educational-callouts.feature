Feature: Push vs Pull Educational Callouts
  As a user learning about push vs pull work models
  I want to see explanations of key concepts
  So that I understand how work assignment, task size, and review culture affect sprint outcomes

  Background:
    Given I am on the Push vs Pull simulator page

  Scenario: Push vs pull systems explanation is always visible
    Then I should see an educational callout about "Push vs Pull Systems"
    And it should explain that push assigns work to individuals while pull uses a shared queue
    And it should mention that task size and review habits differ between models

  Scenario: Review as bottleneck callout appears when push review queue grows
    When the push team's review queue depth exceeds 3 items
    Then I should see a callout about "Review as Bottleneck"
    And it should explain that infrequent review checks cause items to pile up
    And it should note that larger tasks make reviews harder and slower

  Scenario: Shared goals callout appears when pull outperforms push
    When the pull team has completed more items than the push team
    Then I should see a callout about "Shared Goals vs Individual Goals"
    And it should explain that shared goals motivate the team to prioritize reviews
    And it should mention that small tasks enable fast, contextual reviews

  Scenario: Partially done equals waste callout appears at sprint end
    When the simulation reaches the sprint end
    And the push team has more items in progress than the pull team
    Then I should see a callout about "Partially Done = Waste"
    And it should explain that items in progress at sprint end are invested effort with no value delivered
