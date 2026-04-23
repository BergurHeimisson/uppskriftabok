package is.bergur.uppskriftabok.service;

import org.jsoup.nodes.Document;

import java.io.IOException;

public interface PageFetcher {
    Document fetch(String url) throws IOException;
}
