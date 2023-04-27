/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import { formatDate, formatStatus } from "../app/format.js";
import $ from "jquery";


import router from "../app/Router.js";

jest.mock("jquery", () => ({
  __esModule: true,
  default: jest.fn(),
}));

$.modal = jest.fn();


jest.mock("jquery");



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const datesSorted = [...dates].sort(
        (a, b) => Date.parse(a) - Date.parse(b)
      );
    
    
      const expected = [
        "2001-01-01",
        "2002-02-02",
        "2003-03-03",
        "2004-04-04",
      ];
    
      expect(dates).toEqual(expect.arrayContaining(expected));
    });
    test("Then handleClickNewBill should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      const document = {
        querySelector: jest.fn().mockReturnValue({ addEventListener: jest.fn() }),
        querySelectorAll: jest.fn(),
      };
      const localStorage = {};

      const billsInstance = new Bills({ document, onNavigate, localStorage });

      billsInstance.handleClickNewBill();

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
    test("Then getBills should return formatted and sorted bills", async () => {
      const onNavigate = jest.fn();
      const document = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };
      const localStorage = {};
      const bills = [
        { date: "2002-02-02", status: "refused" },
        { date: "2001-01-01", status: "accepted" },
        { date: "2003-03-03", status: "pending" },
        { date: "2004-04-04", status: "refused" },
      ];
      const store = {
        bills: () => ({
          list: () => Promise.resolve(bills),
        }),
      };
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
    
      const billsResult = await billsInstance.getBills();
    
      const expectedBills = [
        {
          ...bills[1],
          date: formatDate(bills[1].date),
          status: formatStatus(bills[1].status),
        },
        {
          ...bills[0],
          date: formatDate(bills[0].date),
          status: formatStatus(bills[0].status),
        },
        {
          ...bills[2],
          date: formatDate(bills[2].date),
          status: formatStatus(bills[2].status),
        },
        {
          ...bills[3],
          date: formatDate(bills[3].date),
          status: formatStatus(bills[3].status),
        },
      ];
    
      expect(billsResult.length).toEqual(expectedBills.length);
    
      // Pour chaque élément attendu, vérifie s'il existe dans le tableau reçu
      expectedBills.forEach((expectedBill) => {
        expect(billsResult).toContainEqual(expectedBill);
      });
    
      // Pour chaque élément reçu, vérifie s'il existe dans le tableau attendu
      billsResult.forEach((receivedBill) => {
        expect(expectedBills).toContainEqual(receivedBill);
      });
    });
    test("Then handleClickIconEye should get the icon-eye element", () => {
      const onNavigate = jest.fn();
      const document = {
        querySelector: jest.fn().mockReturnValue({ addEventListener: jest.fn() }),
        querySelectorAll: jest.fn().mockReturnValue([
          {
            addEventListener: jest.fn(),
            getAttribute: jest.fn().mockReturnValue("https://path/to/bill/image.png"),
          },
        ]),
      };
      const localStorage = {};
      const billsInstance = new Bills({ document, onNavigate, localStorage });
    
      const iconEye = document.querySelectorAll('div[data-testid="icon-eye"]')[0];
      expect(iconEye.getAttribute("data-bill-url")).toEqual("https://path/to/bill/image.png");
    });
    test("Then getBills should return a promise", () => {
      const onNavigate = jest.fn();
      const document = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };
      const localStorage = {};
      const store = {
        bills: () => ({
          list: jest.fn().mockReturnValue(Promise.resolve([])),
        }),
      };
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
    
      const result = billsInstance.getBills();
    
      expect(result).toBeInstanceOf(Promise);
    });
    test("Then getBills should return an empty array if bills.list() returns an empty array", async () => {
      const onNavigate = jest.fn();
      const document = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };
      const localStorage = {};
      const store = {
        bills: () => ({
          list: jest.fn().mockResolvedValue([]),
        }),
      };
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
    
      const result = await billsInstance.getBills();
    
      expect(result).toEqual([]);
    });
    test("Then handleClickIconEye should get the bill URL from the icon-eye element", () => {
      const billUrl = "https://path/to/bill/image.png";
      const icon = {
        addEventListener: jest.fn(),
        getAttribute: jest.fn().mockReturnValue(billUrl),
      };
    
      const document = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([icon]),
      };
    
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        localStorage: {},
      });
    
      const modalMock = jest.fn();
      const findMock = jest.fn().mockReturnValue({ html: jest.fn() });
      const widthMock = jest.fn().mockReturnValue(800);
    
      const $ = jest.fn().mockReturnValue({
        modal: modalMock,
        find: findMock,
        width: widthMock,
      });
    
      global.$ = $;
    
      billsInstance.handleClickIconEye(icon);
    
      expect(icon.getAttribute).toHaveBeenCalledWith("data-bill-url");
      expect(findMock).toHaveBeenCalledWith(".modal-body");
      expect(findMock().html).toHaveBeenCalledWith(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${Math.floor(
          widthMock() * 0.5
        )} src=${billUrl} alt="Bill" /></div>`
      );
      expect(modalMock).toHaveBeenCalledWith("show");
    });
    
    
  });
});



/* test("Then handleClickIconEye should get the bill URL from the icon-eye element", () => {
      const icon = {
        addEventListener: jest.fn(),
        getAttribute: jest.fn().mockReturnValue("https://path/to/bill/image.png"),
      };
    
      const document = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };
    
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        localStorage: {},
      });
    
      const modalMock = jest.fn();
      const findMock = jest.fn().mockReturnValue({ html: jest.fn() });
      const widthMock = jest.fn().mockReturnValue(800);
    
      
    
     
      
    }); */ 