
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API_KEY is handled as per guidelines: direct use of process.env.API_KEY
// The value of process.env.API_KEY is expected to be set in the environment where this code runs.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY environment variable is not set. Gemini API functionality will be disabled.");
}

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const generateGTestMocks = async (headerContent: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Check API_KEY configuration.");
  }

  if (!headerContent.trim()) {
    throw new Error("Header content cannot be empty.");
  }

  const systemInstruction = `You are an expert C++ GTest/GMock assistant.
Your task is to transform the provided C++ header file content into a GTest/GMock version of itself, where public methods are replaced by GMock's MOCK_METHOD macros. The output should be well-commented.`;

  const userPrompt = `
Input: The user will provide the content of a C++ header file.

Output Requirements:
Generate ONLY the modified C++ header code. Do NOT include any explanations, introductory text, comments about your process, or markdown code block fences (like \`\`\`cpp or \`\`\`).
The output should be a direct C++ code representation of the transformed header, with comments explaining the transformations and preserved sections as detailed below.

Transformation Rules:
1.  **Include Guards:**
    *   Preserve the original include guard \`#ifndef\` / \`#define\` / \`#endif\` structure. The names of the guards must remain identical.
    *   Add a comment like \`// Original include guard - preserved.\`
2.  **Includes:**
    *   Add \`#include "gmock/gmock.h"\`
    *   Add \`#include "gtest/gtest.h"\`
    *   These should typically be added near the top, after the \`#define\` of the include guard and before other standard or original includes. Add a comment like \`// GMock and GTest includes added.\`
    *   Retain ALL original \`#include\` directives. Add comments like \`// Original include - preserved.\` for each.
3.  **Namespaces:**
    *   If the original classes/structs are within a namespace, they must remain in the same namespace. Add comments like \`// Original namespace - preserved.\`
4.  **Class/Struct Modification:**
    For each public class or struct (including nested ones) in the input header:
    *   Keep the original class/struct name and its definition structure (e.g., \`class MyClass { ... };\`).
    *   Modify the class/struct in-place. **Do NOT create new mock classes like \`MockClassName\` and do NOT use inheritance for mocking in this transformation.**
    *   Add a comment at the start of the class definition, e.g., \`// Original class definition - transformed for GMock.\` (or \`// Original nested class... \` if applicable).

    *   **Public Methods (EXCLUDING constructors, destructors, static methods, and templated methods):**
        *   Replace the declaration of these public methods with the appropriate GMock \`MOCK_METHOD\` macro.
        *   The format is: \`MOCK_METHOD(<return_type>, <method_name>, (<args_list_with_types_and_names>), (<optional_specifiers_like_const_noexcept>));\`
        *   **Signature Matching:** The entire signature in \`MOCK_METHOD\` MUST EXACTLY match the original. This includes return type, method name, argument types with their names, qualifiers like \`const\`, reference \`&\`, pointer \`*\`, and specifiers like \`noexcept\`.
        *   **\`const\` methods:** If original is \`const\`, include \`const\`. Example: \`MOCK_METHOD(int, getVal, (), (const));\`
        *   **\`noexcept\` specifier:** If original is \`noexcept\`, include \`noexcept\`. Example: \`MOCK_METHOD(void, func, (), (noexcept));\`
        *   **\`override\` and \`final\`:** These keywords from the original method declaration should NOT be carried over to the \`MOCK_METHOD\` line.
        *   **Pure virtual (\`= 0\`):** The \`= 0\` specifier should be removed, as \`MOCK_METHOD\` provides the mock implementation.
        *   **Operator Overloads:** These are treated as regular public methods and should be converted to \`MOCK_METHOD\`. E.g., \`MOCK_METHOD(MyClass&, operator=, (const MyClass& other));\`
        *   **Comments:** Add a comment next to each generated \`MOCK_METHOD\`, e.g., \`// Mocked method.\`

    *   **Constructors and Destructors: CRITICAL PRESERVATION RULE**
        *   All constructors and destructors MUST be preserved **ABSOLUTELY EXACTLY** as they appear in the original header.
        *   This includes: \`virtual\` keyword, parameters, initializer lists, and crucially, any trailing specifiers/bodies (\`= default;\`, \`= del\` + \`ete;\`, \`{}\`, \`{ /* ... code ... */ }\`, simple declarations \`;\`).
        *   **DO NOT convert constructors or destructors to \`MOCK_METHOD\`. Copy them verbatim.**
        *   **Comments:** Add a comment next to each, e.g., \`// Original constructor - preserved.\` or \`// Original virtual destructor - preserved.\`

    *   **Private/Protected Sections: DELETION RULE (CRITICAL - READ CAREFULLY)**
        *   **Delete the ENTIRE \`private:\` section.** This means:
            *   The \`private:\` keyword line itself.
            *   **ALL member variables, method declarations, and method definitions** written between the \`private:\` keyword and the next access specifier (\`public:\`, \`protected:\`) or the closing brace \`};\` of the class/struct **must be COMPLETELY REMOVED.**
        *   **Delete the ENTIRE \`protected:\` section similarly.** This means:
            *   The \`protected:\` keyword line itself.
            *   **ALL member variables, method declarations, and method definitions** written between the \`protected:\` keyword and the next access specifier (\`public:\`) or the closing brace \`};\` of the class/struct **must be COMPLETELY REMOVED.**
        *   Add a comment where these sections were, e.g., \`// Private section and all its contents removed for mock generation.\` and \`// Protected section and all its contents removed for mock generation.\`
        *   **Note:** If preserved constructors/destructors had inline definitions that used members from these deleted sections, the resulting code might require manual adjustments. The rule is to delete the sections and their entire contents, and preserve constructor/destructor bodies verbatim.

    *   **Static Methods:**
        *   Public static methods cannot be mocked with instance-based \`MOCK_METHOD\`. Preserve them as-is.
        *   **Comments:** Add a comment like \`// Static method - preserved. Instance-based mocking (MOCK_METHOD) is not applicable. Consider refactoring (e.g., Adapter pattern) if this static method is an external dependency you need to control in tests.\`

    *   **Templated Methods and Classes:**
        *   **Templated Classes:** If a class is a template (e.g., \`template <typename T> class MyClass { ... }\`), preserve the entire class structure and its methods as-is. Add a comment at the top of the class: \`// Templated class - preserved. TODO: Manual review needed for mocking strategies.\`
        *   **Templated Methods:** If a public method within a non-templated class is a template method (e.g., \`template <typename T> void process(T value);\`), preserve the method as-is. Add a comment: \`// Templated method - preserved (manual mocking may be needed).\`

5.  **Other Code Elements:**
    *   Preserve all other code (e.g., original comments, typedefs, enums, using declarations, static members, member variables in public sections, public deleted methods that are not constructors/destructors, \`friend\` declarations, C-style macros) exactly as they appear, unless they are public method declarations being replaced or part of private/protected sections.
    *   **Comments:** Add descriptive comments for ALL preserved items indicating their preservation, e.g., \`// Original typedef - preserved.\`, \`// Original friend declaration - preserved.\`, \`// Original macro definition - preserved.\`

Example of Transformation:
Input Header:
\`\`\`cpp
#ifndef EXAMPLE_CLASS_H
#define EXAMPLE_CLASS_H

#include <string>
#include <vector>
#include <functional>

#define MY_CUSTOM_MACRO(x) (x+1)

namespace MyNamespace {

friend class AnotherClass; // Friend declaration

struct MyData {
    int id;
    struct NestedStruct { // Nested struct
      std::string name;
    };
};

template<typename T>
class TemplatedLogger { // Templated class
public:
    TemplatedLogger(T initial) : t_val(initial) {}
    void log(const T& data);
private:
    T t_val;
};

class ExampleClass {
public:
    ExampleClass(int initialValue);
    ExampleClass() = default;
    virtual ~ExampleClass() {}
    ExampleClass(const ExampleClass&) = del\` + \`ete;
    ExampleClass(float f);

    virtual int getValue() con\`+\`st = 0;
    void processData(const std::string& data, int count) noex\`+\`cept over\`+\`ride;
    std::vector<char> getChars() fin\`+\`al;
    static void utilityFunction();
    ExampleClass& operator=(const ExampleClass& other);
    template <typename U>
    void templatedMethod(U param);
    void someOtherMethod() = del\` + \`ete;

    using DataCallback = std::function<void(const MyData&)>;
    DataCallback onData;
    int publicMemberVar;

protected:
    int protectedValue;
    void protectedHelper();

private:
    int value;
    void helperFunction(std::string s);
};

} // namespace MyNamespace
#endif // EXAMPLE_CLASS_H
\`\`\`

Expected Output (Transformed Header):
\`\`\`cpp
// Original include guard - preserved.
#ifndef EXAMPLE_CLASS_H
#define EXAMPLE_CLASS_H

// GMock and GTest includes added.
#include "gmock/gmock.h"
#include "gtest/gtest.h"
// Original include - preserved.
#include <string>
// Original include - preserved.
#include <vector>
// Original include - preserved.
#include <functional>

// Original macro definition - preserved.
#define MY_CUSTOM_MACRO(x) (x+1)

// Original namespace - preserved.
namespace MyNamespace {

// Original friend declaration - preserved.
friend class AnotherClass;

// Original struct - preserved.
struct MyData {
    int id; // Original public member - preserved.
    // Original nested struct - preserved.
    struct NestedStruct {
      std::string name; // Original public member - preserved.
    };
};

// Templated class - preserved. TODO: Manual review needed for mocking strategies.
template<typename T>
class TemplatedLogger {
public:
    TemplatedLogger(T initial) : t_val(initial) {} // Original constructor - preserved.
    void log(const T& data); // Original method in templated class - preserved.
// Private section and all its contents removed for mock generation.
};

// Original class definition - transformed for GMock.
class ExampleClass {
public:
    ExampleClass(int initialValue);     // Original constructor - preserved.
    ExampleClass() = default;           // Original constructor - preserved.
    virtual ~ExampleClass() {}            // Original virtual destructor - preserved.
    ExampleClass(const ExampleClass&) = del\` + \`ete; // Original constructor - preserved.
    ExampleClass(float f);              // Original constructor - preserved.

    MOCK_METHOD(int, getValue, (), (const)); // Mocked method. (Original was pure virtual)
    MOCK_METHOD(void, processData, (const std::string& data, int count), (noexcept)); // Mocked method. (Original had override)
    MOCK_METHOD(std::vector<char>, getChars, ()); // Mocked method. (Original had final)
    // Static method - preserved. Instance-based mocking (MOCK_METHOD) is not applicable. Consider refactoring (e.g., Adapter pattern) if this static method is an external dependency you need to control in tests.
    static void utilityFunction();
    MOCK_METHOD(ExampleClass&, operator=, (const ExampleClass& other)); // Mocked method. (Operator overload)
    // Templated method - preserved (manual mocking may be needed).
    template <typename U>
    void templatedMethod(U param);
    void someOtherMethod() = del\` + \`ete; // Public deleted method - preserved.

    // Original using declaration - preserved.
    using DataCallback = std::function<void(const MyData&)>;
    // Original public member - preserved.
    DataCallback onData;
    // Original public member - preserved.
    int publicMemberVar;

// Protected section and all its contents removed for mock generation.
// Private section and all its contents removed for mock generation.
};

} // namespace MyNamespace
#endif // EXAMPLE_CLASS_H
\`\`\`

C++ Header File Content to transform:
---
${headerContent}
---

Transformed GTest Mock Header File Content (ensure this is only C++ code and follows all rules above, including adding comments):
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt, // The detailed instructions, examples, and user's header content
      config: {
        systemInstruction: systemInstruction, // The AI's role and high-level task
      },
    });
    
    const generatedText = response.text;
    if (!generatedText || generatedText.trim() === '') {
        // Fallback for truly empty or whitespace-only responses
        const classMatch = headerContent.match(/class\s+(\w+)\s*{/);
        const className = classMatch ? classMatch[1] : "MyClass";
        return `// Gemini API returned an empty or invalid response.\n// Please check your input or API key.\n// Attempting a basic placeholder:\n#include "gmock/gmock.h"\n#include "gtest/gtest.h"\n\n${headerContent}\n\n/* TODO: Manually add MOCK_METHOD calls for class ${className} if it exists in the header above. */\n// Ensure comments are added as per generation rules.`;
    }
    return generatedText.trim();
  } catch (error) {
    console.error("Error generating GTest mocks from Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("Invalid API Key. Please ensure your API_KEY environment variable is correctly set.");
        }
        throw new Error(`Failed to generate mocks via Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
