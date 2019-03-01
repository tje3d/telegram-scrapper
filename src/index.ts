import request from "request";
import cheerio from "cheerio";
import { PostTypes } from "./interfaces";

class WebPost {
  url: string;
  html!: CheerioStatic;
  loaded: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  async load(): Promise<boolean> {
    if (this.loaded) {
      return true;
    }

    return new Promise(resolve => {
      request(
        this.url,
        {
          timeout: 30000,
          gzip: true,
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language":
              "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7,ps;q=0.6,ar;q=0.5,de;q=0.4,es;q=0.3,mt;q=0.2,pl;q=0.1,la;q=0.1",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36"
          }
        },
        (error, response, body) => {
          this.loaded = true;

          try {
            this.html = cheerio.load(body);
          } catch (e) {
            console.log(e);
          }

          resolve(true);
        }
      );
    });
  }

  get type(): PostTypes {
    if (this.html("a.tgme_widget_message_video_player").length != 0) {
      return PostTypes.VIDEO;
    }

    if (this.html("a.tgme_widget_message_photo_wrap").length != 0) {
      return PostTypes.IMAGE;
    }

    if (this.html("a.tgme_widget_message_text").length != 0) {
      return PostTypes.TEXT;
    }

    return PostTypes.UNKNOWN;
  }

  get video(): string | null {
    return this.html("video").attr("src") || null;
  }

  get text(): string {
    return this.html(".tgme_widget_message_text").html() || "";
  }

  get image(): string | null {
    let style: string = this.html(".tgme_widget_message_photo_wrap").attr(
      "style"
    );

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

(async () => {
  let post1: WebPost = new WebPost("https://t.me/akhbarefori/154952?embed=1");
  //   let post1: WebPost = new WebPost("https://t.me/akhbarefori/154939?embed=1");
  await post1.load();

  switch (post1.type) {
    case PostTypes.VIDEO:
      console.warn({
        type: "Video",
        image: post1.image,
        url: post1.video,
        text: post1.text
      });
      break;
    case PostTypes.IMAGE:
      console.warn({
        type: "Image",
        image: post1.image,
        video: post1.video,
        text: post1.text
      });
      break;
    case PostTypes.TEXT:
      console.warn("Text");
      break;
    case PostTypes.UNKNOWN:
      console.warn("Unknown");
      break;
  }
})();
