/**
 * Object describing a survey
 */
 class Survey {
    /**
     * Create a new Survey
     * @param {*} id unique integer identifier for the survey
     * @param {*} title string title
     * @param {*} adminId the admin identifier who created the survey
     */
    constructor(id, title, adminId) {
        this.id = id;
        this.title = title;
        this.adminId = adminId;
        this.questions = [];
        this.countReplies = 0;
        this.replyIds = [];
    }

    addQuestion(question) {
      this.questions.push(question);
    }
  
    /**
     * Creates a new Survey from plain (JSON) objects
     * @param {*} json a plain object (coming from JSON deserialization)
     * with the right properties
     * @return {Survey} the newly created object
     */
    static from(json) {
      const survey = new Survey(json.id, json.title, json.admin_id);
      return survey;
    }
  
  }
  
  export default Survey;