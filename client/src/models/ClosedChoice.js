/**
 * Object describing a closed choice
 */
 class ClosedChoice {
    /**
     * Create a new Closed choice
     * @param {*} id unique integer identifier (relative!) to the associated question
     * @param {*} content the content of the closed choice
     */
    constructor(id, content) {
        this.id = id;
        this.content = content;
    }
  
    /**
     * Creates a new ClosedChoice from plain (JSON) objects
     * @param {*} json a plain object (coming from JSON deserialization)
     * with the right properties
     * @return {Question} the newly created object
     */
    static from(json) {
      const cc = new ClosedChoice(json.id, json.content);
      return cc;
    }
  
  }
  
  export default ClosedChoice;