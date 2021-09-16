public class SimonAppController {
	
    @AuraEnabled(cacheable=true)
    public static List<Score__c> getScores() {
        List<Score__c> scores = [SELECT Player_Name__c, Score__c FROM Score__c ORDER BY Score__c DESC];
        return scores;
    }
    
    @AuraEnabled(cacheable=false)
    public static void createScore(String playerName, Integer score) {
        Score__c scoreEntry = new Score__c(Player_Name__c = playerName, Score__c = score);
        insert scoreEntry;
    }
    
    public static void create_score(String playerName, Integer score) {
        Score__c scoreEntry = new Score__c(Player_Name__c = playerName, Score__c = score);
        insert scoreEntry;
    }
}