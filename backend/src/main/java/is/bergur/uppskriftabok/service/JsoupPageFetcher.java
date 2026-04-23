package is.bergur.uppskriftabok.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JsoupPageFetcher implements PageFetcher {

    @Override
    public Document fetch(String url) throws IOException {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; Uppskriftabok/1.0)")
                .timeout(10_000)
                .get();
    }
}
