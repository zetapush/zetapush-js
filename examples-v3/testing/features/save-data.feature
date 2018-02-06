Feature: SaveData
    Scenario: save 10 in database
        Given I store 10 in database
        When I retrieve 10 from the database
        Then I have 10 as result