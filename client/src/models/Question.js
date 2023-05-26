/**
 * Object describing a question
 */
class Question {
  /**
   * Create a new Question
   * @param {*} id unique integer identifier for the question
   * @param {*} title string title
   * @param {*} type the type of question (0: open, 1: closed)
   * @param {*} min the minimum amount of answers you can give to it
   * @param {*} max the maximum amount of answers you can give to it
   * @param {*} orderingPosition the ordering position of the question inside the survey
   */
  constructor(id, title, type, min, max, orderingPosition) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.min = min;
    this.max = max;
    this.orderingPosition = orderingPosition;
    this.closedChoices = [];
  }

  addClosedChoice(cc) {
    this.closedChoices.push(cc);
  }

  indexOfClosedChoice(ccId) {
    for (let i = 0; i < this.closedChoices.length; i++) {
      if (ccId === this.closedChoices[i].id)
        return i;
    }
    return -1;
  }

  /**
   * Creates a new Question from plain (JSON) objects
   * @param {*} json a plain object (coming from JSON deserialization)
   * with the right properties
   * @return {Question} the newly created object
   */
  static from(json) {
    const question = new Question(json.id, json.title, json.type, json.min, json.max, json.ordering_position);
    return question;
  }

  static shallowCopy(other) {
    const question = new Question(other.id, other.title, other.type, other.min, other.max, other.ordering_position);
    question.closedChoices = other.closedChoices;
    return question;
  }

}

export default Question;