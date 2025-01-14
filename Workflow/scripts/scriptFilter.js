ObjC.import('stdlib');
ObjC.import('Foundation');

function readFileContent(filePath) {
    const fileManager = $.NSFileManager.defaultManager;
    const fileExists = fileManager.fileExistsAtPath(filePath);
    
    if (!fileExists) {
        return null;
    }
    
    const data = $.NSString.alloc.initWithContentsOfFileEncodingError(filePath, $.NSUTF8StringEncoding, null);
    return data ? data.js : null;
}

function run(argv) {
    const cacheDir = $.getenv('alfred_workflow_cache');
    
    // Read necessary files
    const currentIndex = readFileContent(cacheDir + '/currentIndex.txt');
    const status = readFileContent(cacheDir + '/status.txt');
    const url = readFileContent(cacheDir + '/url.txt');
    const title = readFileContent(cacheDir + '/title.txt');
    const totalItems = readFileContent(cacheDir + '/totalItems.txt');

    // State 1: Initial state - no files selected
    if (!totalItems) {
        return createJsonResponse({
            title: "No Auphonic Processing in Progress",
            subtitle: "Initiate via file actions.",
            valid: 'true',
            mods: { 
                'cmd': {valid: true, arg: url || '', subtitle: 'Open the last saved URL.'},
            }
        });
    }

    // State 2: Files selected but processing not started
    if (!status) {
        return createJsonResponse({
            title: "Status: Uploading",
            subtitle: "Uploading to Auphonic's Servers. Please wait...",
            valid: 'false'
        }, true);
    }

    // State 3: Processing in progress
    const current = parseInt(currentIndex || '0', 10);
    const total = parseInt(totalItems || '1', 10);
    const itemPosition = `${current + 1} out of ${total}`;
    
    return createJsonResponse({
        title: `Status: ${status || 'Unknown'} | File: ${itemPosition}`,
        subtitle: `Press return to open URL of "${title || 'Unknown'}"`,
        arg: url || ''
    }, true);
}

function createJsonResponse(item, rerun = false) {
    const response = {
        items: [{
            ...item,
            type: 'default'
        }]
    };

		if (rerun) {
        response.rerun = 1;
    }
    
    return JSON.stringify(response);
}