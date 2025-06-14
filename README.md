# GTest Mock Generator

A web application to generate GTest mock definitions from C++ header files using the Gemini API.

## How to Use (User Interface Guide)

This application transforms your C++ header files by adding GMock macros for public methods, preserving essential structures, and removing private/protected sections, preparing them for unit testing with Google Test and Google Mock.

### 1. Selecting Files

*   **Select Header Files:** Click the "Select Header Files (.h, .hpp)" button to open a file dialog. You can select one or more C++ header files (typically with `.h`, `.hpp`, or `.hh` extensions).
*   **Select Directory:** Click the "Select Directory" button to select an entire folder. The application will attempt to find and list all valid header files within that directory.
*   **Accepted File Types:** The application primarily looks for `.h`, `.hpp`, and `.hh` files.

### 2. Managing Selected Files

*   Once files are selected, they will appear in a list under "Selected Files:".
*   Each file entry shows its name and size.
*   To remove a file from the list before processing, click the **X** (Remove file) icon next to its name.

### 3. Generating Mocks

*   Click the **"Generate Mocks"** button.
*   The application will read each selected file and send its content to the Gemini API for transformation.
*   The status of the "Generate Mocks" button will update to show progress (e.g., "Reading [filename]...", "Generating mock for [filename]...").

### 4. Viewing and Using Generated Mocks

*   After processing, each file will have a corresponding card in the "Generated Mock Files" section.
*   Each card displays:
    *   The original filename.
    *   The processing status (`pending`, `loading`, `success`, `error`).
    *   If successful, the generated mock C++ code is shown in a code block.
    *   **Copy:** Click the "Copy" button to copy the generated mock code to your clipboard.
    *   **Download .h:** Click the "Download .h" button to download the generated mock code as a `.h` file. The downloaded file will have the **same name as the original header file**.
*   If an error occurs for a file, an error message will be displayed on its card.

### 5. Bulk Operations

*   **Download All as ZIP:** Click this button to download a single ZIP file named `GTestMocks.zip`. This ZIP file will contain all successfully generated mock header files. Each file within the ZIP will retain its **original filename**.
    *   **To save all mocks to a specific folder (e.g., "mocks"):**
        1.  Click "Download All as ZIP".
        2.  Once `GTestMocks.zip` is downloaded, navigate to your desired "mocks" folder on your computer.
        3.  Extract the contents of `GTestMocks.zip` into this "mocks" folder.
*   **Clear All:** Click this button to remove all selected files from the list and clear any generated results from the display.

## "Commands" (Achieving Goals via UI)

Since this is a web application, "commands" are performed through UI interactions:

*   **To add files for processing:**
    *   Use the "Select Header Files" button for individual files.
    *   Use the "Select Directory" button for all headers in a folder.
*   **To generate mocks for selected files:**
    *   Click the "Generate Mocks" button.
*   **To save a single generated mock file:**
    *   Click the "Download .h" button on the card for that specific file. The filename will be the same as the original.
*   **To save all generated mock files into a local "mocks" folder:**
    *   Click the "Download All as ZIP" button.
    *   Create a folder named "mocks" (or any other name) on your computer.
    *   Extract the downloaded `GTestMocks.zip` file into that folder.

## How It Works (AI Transformation)

The application sends the content of your header files to the Google Gemini API. The AI is instructed to perform the following key transformations:

*   **Includes:** Adds `#include "gmock/gmock.h"` and `#include "gtest/gtest.h"`. Original includes are preserved.
*   **Public Methods:** Converts most public method declarations to `MOCK_METHOD(...)` macros, matching the original signature (return type, name, arguments, `const`, `noexcept`). `override` and `final` are not carried to `MOCK_METHOD`. Pure virtual specifiers (`= 0`) are removed.
*   **Constructors & Destructors:** Preserved **exactly** as they are in the original header (including `= default`, `= delete`, bodies, etc.). They are NOT mocked.
*   **Private & Protected Sections:** The entire `private:` and `protected:` sections (including all members and methods within them) are **deleted**. Comments are left in their place.
*   **Templated Classes & Methods:** Preserved as-is with a `// TODO: Manual review...` comment, as direct in-place mocking is complex.
*   **Static Methods:** Preserved as-is with a comment, as they cannot be instance-mocked.
*   **Other Code Elements:** Include guards, namespaces, typedefs, enums, public member variables, `friend` declarations, and C-style macros are generally preserved with explanatory comments.
*   **Comments:** The AI is instructed to add comments throughout the generated code explaining what was done (e.g., `// Mocked method.`, `// Original constructor - preserved.`, `// Private section removed...`).
*   **Filenames:** The application ensures that downloaded mock files (individual or in ZIP) retain their original filenames.

## API Key Requirement

This application requires a valid Google Gemini API Key to function. The key must be available as an environment variable named `process.env.API_KEY` in the execution environment where the application is run/hosted. If the API key is missing or invalid, mock generation will fail.

## Troubleshooting

*   **No Mocks Generated / Errors:**
    *   Ensure your `API_KEY` is correctly set up in the environment.
    *   Check for any global error messages displayed in the UI.
    *   Review the error message on individual file cards if some succeed and others fail.
    *   Ensure the input C++ header files are well-formed. Very complex or unusual C++ syntax might sometimes challenge the AI.
*   **"Download All as ZIP" fails:** Ensure you have at least one successfully generated mock.

---

Enjoy using the GTest Mock Generator!
