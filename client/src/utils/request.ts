import axios from "axios";
import { getItem } from "./session";
import toast from "react-hot-toast";

const makeRequest = async (
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  endPoint: string,
  data: unknown
) => {
  try {
    let headers = {};
    if (getItem("access_token")) {
      headers = {
        authorization: `Bearer ${getItem("access_token")}`,
      };
    }

    return await axios({
      baseURL: `http://${window.location.hostname}:5000/api`,
      url: endPoint,
      method,
      data,
      headers: {
        ...headers,
      },
    });
  } catch (error: any) {
    console.log(error);
    toast.error(error.response.data.message || 'Unkown Error!');
    throw error;
  }
};

// GET
export const getService = async (endPoint: string) =>
  makeRequest("GET", endPoint, null);

// POST
export const postService = async (endPoint: string, reqest: unknown) =>
  makeRequest("POST", endPoint, reqest);

// PUT
export const putService = async (endPoint: string, reqest: unknown) =>
  makeRequest("PUT", endPoint, reqest);

// PATCH
export const patchService = async (endPoint: string, reqest: unknown) =>
  makeRequest("PATCH", endPoint, reqest);

// DELETE
export const deleteService = async (endPoint: string) =>
  makeRequest("DELETE", endPoint, null);
