"use client";

import { Language } from "prism-react-renderer";
import Code from "./Code";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const API_URL = 'https://vector.profanity.dev';

const codeBlocks: Record<Language, string> = {
  tsx: `const res = await fetch('${API_URL}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })`,
  python: `import requests

res = requests.post(
  '${API_URL}', 
  json={'message': message}
)`,
  go: `import (
  "bytes"
  "encoding/json"
  "net/http"
  "log"
)

reqBody, err := json.Marshal(map[string]string{"message": message})
if err != nil {
  log.Fatal(err)
}

res, err := http.Post(
  '${API_URL}', 
  "application/json", 
  bytes.NewBuffer(reqBody)
)

if err != nil {
  log.Fatal(err)
}`,
  java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create('${API_URL}'))
  .header("Content-Type", "application/json")
  .POST(BodyPublishers.ofString("{\"message\": \"" + message + "\"}"))
  .build();
try {
  HttpResponse<String> response = client.send(
    request, 
    HttpResponse.BodyHandlers.ofString()
  );
} catch (Exception e) {
  e.printStackTrace();
}`,  
};

const CodeSection = () => {
  const [language, setLanguage] = useState<Language>("tsx");
  return (
    <>
      <div className=" relative max-w-2xl w-full">
        <Select defaultValue="tsx" onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="tsx">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="relative max-w-2xl w-full text-left p-5 bg-[#1e1e1e] rounded-xl shadow mt-2">
        <ScrollArea className="relative">
          {codeBlocks[language] !== undefined ? (	
          <Code language="tsx" code={codeBlocks[language]} />
          ) : (
          <div className="text-white">No code available for this language</div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
};

export default CodeSection;
