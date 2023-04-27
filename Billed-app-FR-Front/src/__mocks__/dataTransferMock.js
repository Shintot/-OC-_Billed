class DataTransferMock {
    constructor() {
      this.items = [];
    }
  
    add(item) {
      this.items.push(item);
    }
  
    get files() {
      return this.items.filter((item) => item.kind === "file");
    }
  }
  
  export default DataTransferMock;
  