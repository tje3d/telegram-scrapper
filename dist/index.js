"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const cheerio_1 = __importDefault(require("cheerio"));
const interfaces_1 = require("./interfaces");
class WebPost {
    constructor(url) {
        this.loaded = false;
        this.url = url;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loaded) {
                return true;
            }
            return new Promise(resolve => {
                request_1.default(this.url, {
                    timeout: 30000,
                    gzip: true,
                    headers: {
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7,ps;q=0.6,ar;q=0.5,de;q=0.4,es;q=0.3,mt;q=0.2,pl;q=0.1,la;q=0.1",
                        "Cache-Control": "max-age=0",
                        Connection: "keep-alive",
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36"
                    }
                }, (error, response, body) => {
                    this.loaded = true;
                    try {
                        this.html = cheerio_1.default.load(body);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    resolve(true);
                });
            });
        });
    }
    get type() {
        if (this.html("a.tgme_widget_message_video_player").length != 0) {
            return interfaces_1.PostTypes.VIDEO;
        }
        if (this.html("a.tgme_widget_message_photo_wrap").length != 0) {
            return interfaces_1.PostTypes.IMAGE;
        }
        if (this.html("a.tgme_widget_message_text").length != 0) {
            return interfaces_1.PostTypes.TEXT;
        }
        return interfaces_1.PostTypes.UNKNOWN;
    }
    get video() {
        return this.html("video").attr("src") || null;
    }
    get text() {
        return this.html(".tgme_widget_message_text").html() || "";
    }
    get image() {
        let style = this.html(".tgme_widget_message_photo_wrap").attr("style");
        if (!style) {
            return null;
        }
        let match = style.match(/\'(.*)\'/);
        if (!match) {
            return null;
        }
        return match[1];
    }
}
(() => __awaiter(this, void 0, void 0, function* () {
    let post1 = new WebPost("https://t.me/akhbarefori/154952?embed=1");
    //   let post1: WebPost = new WebPost("https://t.me/akhbarefori/154939?embed=1");
    yield post1.load();
    switch (post1.type) {
        case interfaces_1.PostTypes.VIDEO:
            console.warn({
                type: "Video",
                image: post1.image,
                url: post1.video,
                text: post1.text
            });
            break;
        case interfaces_1.PostTypes.IMAGE:
            console.warn({
                type: "Image",
                image: post1.image,
                video: post1.video,
                text: post1.text
            });
            break;
        case interfaces_1.PostTypes.TEXT:
            console.warn("Text");
            break;
        case interfaces_1.PostTypes.UNKNOWN:
            console.warn("Unknown");
            break;
    }
}))();
