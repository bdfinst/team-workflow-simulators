Feature: Push vs Pull Sprint Simulation Engine
  As a user exploring sprint workflow patterns
  I want to run a per-member simulation of work items in a time-boxed sprint
  So that I can see how push (assigned) vs pull (shared) work models affect sprint outcomes

  Background:
    Given a team of 5 members: Alex, Blake, Casey, Drew, and Ellis
    And a sprint length of 10 days
    And 8 ticks per day

  Scenario: Each team member is shown as an independent row
    When the simulation starts
    Then each member should be visible as a separate row
    And each member should show their current state: idle, coding, or reviewing

  Scenario: Push model assigns items to specific members at sprint start
    Given the push model with 10 large work items
    When the simulation starts
    Then each member should have items assigned to them
    And members work through their assigned items sequentially

  Scenario: Pull model uses a shared backlog
    Given the pull model with 25 small work items
    When the simulation starts
    Then all items should be in a shared backlog
    And the next available member pulls the highest-priority item

  Scenario: Push model has larger tasks with longer dev time
    Given the push model with dev time of 12-16 ticks per item
    When a member starts coding
    Then the coding duration should be between 12 and 16 ticks
    And this corresponds to approximately 1.5-2 days of work

  Scenario: Pull model has smaller tasks with shorter dev time
    Given the pull model with dev time of 4-8 ticks per item
    When a member starts coding
    Then the coding duration should be between 4 and 8 ticks
    And this corresponds to approximately 0.5-1 day of work

  Scenario: Push members check for reviews infrequently
    Given the push model with review check interval of 16 ticks
    When a member finishes coding their item
    Then the member starts their next assigned item immediately
    And only checks for pending reviews every 16 ticks (2 days)
    And items sit in review-queue until someone checks

  Scenario: Pull members prioritize reviews after each task
    Given the pull model with review check after every coding task
    When a member finishes coding
    Then the member first checks if any items are waiting for review
    And reviews take priority over pulling new work from the backlog
    And items flow through review quickly

  Scenario: Push reviews take longer due to lack of context
    Given the push model with review duration of 6-8 ticks
    When a member reviews an item
    Then the review should take 6-8 ticks (approximately 0.75-1 day)
    Because the reviewer lacks shared understanding of the code

  Scenario: Pull reviews are fast due to shared context
    Given the pull model with review duration of 2-4 ticks
    When a member reviews an item
    Then the review should take 2-4 ticks (approximately 0.25-0.5 day)
    Because the team has shared context on small changes

  Scenario: Work items progress through states
    When a member pulls an item from the backlog
    Then the item state changes from "backlog" to "dev"
    When the member finishes coding
    Then the item state changes from "dev" to "review-queue"
    When another member picks it up for review
    Then the item state changes from "review-queue" to "review"
    When the review is complete
    Then the item state changes from "review" to "done"

  Scenario: Sprint ends at the configured day count
    When the simulation runs for 80 ticks (10 days × 8 ticks/day)
    Then the simulation should stop at the sprint boundary
    And any items not in "done" state should be counted as incomplete

  Scenario: Backlog has more work than the team can complete
    Given the push model with 10 items at 12-16 ticks dev time each
    And the pull model with 25 items at 4-8 ticks dev time each
    Then neither model should complete all items within the sprint
    And total work effort should be roughly equivalent between models

  Scenario: Pull model completes more items within the sprint
    Given both push and pull simulations are running
    When the simulation runs to sprint end
    Then the pull model should have more items in "done" state
    Because small tasks flow through review faster

  Scenario: Push model has more items stuck in progress at sprint end
    Given both push and pull simulations are running
    When the simulation runs to sprint end
    Then the push model should have more items in "dev" or "review-queue" state
    And items in progress at sprint end represent wasted effort
