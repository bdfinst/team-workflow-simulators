Feature: Push vs Pull Side-by-Side Comparison
  As a user learning about push vs pull work models
  I want to see both team simulations running simultaneously
  So that I can directly compare how each team member works under each model

  Background:
    Given I am on the Push vs Pull simulator page

  Scenario: Both teams are visible side by side
    Then I should see two team panels side by side
    And the left panel should be labeled "Push / Assigned"
    And the right panel should be labeled "Pull / Shared"

  Scenario: Each team shows 5 named member rows
    Then each panel should show 5 member rows
    And each row should display the member's name
    And the member names should be Alex, Blake, Casey, Drew, and Ellis

  Scenario: Member rows show current activity
    When I start the simulation
    Then each member row should show one of: idle, coding, or reviewing
    And coding members should show which item they are working on
    And reviewing members should show which item they are reviewing

  Scenario: Push team members work on assigned items
    When I start the simulation
    Then push team members should each work through their own assigned items
    And items should not move between members in the push model

  Scenario: Pull team members pull from shared backlog
    When I start the simulation
    Then pull team members should pull items from a shared backlog
    And any available member can pull the next priority item

  Scenario: Review queue is visible for each team
    When the simulation has been running
    Then I should see the review queue for each team
    And the push team's review queue should grow larger over time
    And the pull team's review queue should stay small

  Scenario: Push team shows items waiting longer for review
    When I run the simulation to day 5
    Then the push team should have items visibly stuck in "review-queue"
    And the pull team should have fewer items in "review-queue"

  Scenario: Pull team completes more items within the sprint
    When I run the simulation to sprint end
    Then the pull team should have completed more items
    And the pull team should have lower average lead time
    And the pull team should have higher flow efficiency

  Scenario: Push team has more waste at sprint end
    When I run the simulation to sprint end
    Then the push team should have more items still in progress
    And the difference demonstrates the cost of infrequent reviews and large tasks

  Scenario: Sprint completion banner appears at sprint end
    When I run the simulation to sprint end
    Then I should see a sprint completion banner
    And it should show the completed item counts for both teams
