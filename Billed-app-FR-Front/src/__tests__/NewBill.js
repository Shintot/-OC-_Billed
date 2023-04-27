import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import DataTransferMock from "../__mocks__/dataTransferMock";


// Ajoutez cette partie avant la section 'describe'
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  // Initialisez le localStorage avec une valeur par défaut pour "user"
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@billed.com",
    })
  );
});


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be submitted with correct values", async() => {
      // Arrange
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH[pathname];
      };
      const store = {
        bills: () => ({
          create: () => Promise.resolve(),
          update: () => Promise.resolve(),
        }),
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store,
      });

      const form = screen.getByTestId("form-new-bill");
      const expenseTypeSelect = screen.getByTestId("expense-type");
      const expenseNameInput = screen.getByTestId("expense-name");
      const amountInput = screen.getByTestId("amount");
      const dateInput = screen.getByTestId("datepicker");
      const vatInput = screen.getByTestId("vat");
      const pctInput = screen.getByTestId("pct");
      const commentaryInput = screen.getByTestId("commentary");

      // Act
      fireEvent.change(expenseTypeSelect, { target: { value: "Restaurant" } });
      fireEvent.change(expenseNameInput, { target: { value: "Lunch" } });
      fireEvent.change(amountInput, { target: { value: "12" } });
      fireEvent.change(dateInput, { target: { value: "2023-04-21" } });
      fireEvent.change(vatInput, { target: { value: "20" } });
      fireEvent.change(pctInput, { target: { value: "10" } });
      fireEvent.change(commentaryInput, {
        target: { value: "Business lunch" },
      });

      fireEvent.submit(form);

    });
    test("Then handleChangeFile should be called and set the fileUrl and fileName", async () => {
      // Arrange
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH[pathname];
      };
      const fileUrl = "http://example.com/file.jpg";
      const store = {
        bills: () => ({
          create: () => Promise.resolve({ fileUrl, key: "123456789" }),
          update: () => Promise.resolve(),
        }),
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store,
      });
    
      const fileInput = screen.getByTestId("file");
    
      // Créez un espion pour la méthode handleChangeFile
      const handleChangeFileSpy = jest.spyOn(newBill, "handleChangeFile");
    
      // Appelez la méthode registerChangeHandler manuellement
      newBill.registerChangeHandler();
    
      // Act
      const file = new File(["file"], "file.jpg", { type: "image/jpeg" });
    
      // Utilisez directement l'événement change sans essayer de définir la valeur de l'input
      fireEvent.change(fileInput, {
        target: { files: [file] },
      });
    });
  });
});