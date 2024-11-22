"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.savePassword = void 0;
const bcryptjs_1 = require("bcryptjs");
const file_manage_1 = require("./file_manage");
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        return yield (0, bcryptjs_1.hash)(password, saltRounds);
    });
}
const savePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield hashPassword(password);
        yield (0, file_manage_1.writeData)('password', hashedPassword);
    }
    catch (err) {
        throw err;
    }
});
exports.savePassword = savePassword;
const verifyPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storedHash = yield (0, file_manage_1.readData)('password');
        return yield (0, bcryptjs_1.compare)(password, storedHash || '');
    }
    catch (err) {
        throw err;
    }
});
exports.verifyPassword = verifyPassword;
