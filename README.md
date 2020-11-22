# VpK - Visual parsed Kubernetes 
<br>

<b>VpK</b> was created as the result of needing a tool to understand what is defined in Kubernetes.

<b>VpK</b> is comprised of a server and browser features.  The server portion is a node.js application that reads and parses Kubernetes definition 'yaml' files.  The 'yaml' files are created by getting each resource type from the Kubernetes cluster. This collection of yaml files is stored in a directory that is created by this application.  The directory storing the files is available offline.  To populate the directory a running Kubernetes cluster must be accessed.


The user interface (browser portion) communicates with the server using both http and web sockets. The UI provides multple views, both graphical and tabular to help understand Kubernetes.


(insert arch pic here)

Application features include:

- Access a running instance of Kubernetes and obtain configuration information for all defined resources. 
- Create individual yaml file for each unique resource. 
- Read and parse yaml resource files to produce data structures that are used by the user interface. 
- View and filter resources.
- Render schematics of workloads with associated resources. 
 
- ADD MORE HERE

	


## Installation

	
	Node.js and npm are required to install and execute this application
	

You cannot install and run this application without first installing node.js and npm.  Once the prerequisites are installed proceed to the next step. 

Download the source files and place in a directory.  The source files are available on github and can be downloaded using the following clone command or retrieved 

git clone https://github.com/k8debug/vpk.git/ 

Change to the directory where the files were placed. Run the following 
NPM command to install the required Node modules:

	npm install

Once the above has successfully completed the application can be run.  

Test the program installation by entering the following command from the directory where the above command was executed.

<b>

node server.js   
</b> 

### Update software

There is no automated process to update an existing version of this software.   A complete new install is required.  Follow the above <b>'Installation'</b> instructions to install a new version of the software.

<br><br>

## Start parameters

VpK has two optional start parameters, directory and port. Examples of there usage are shown below:  

Example using port other than the default:

<b>
node server.js  -p 3000   
</b> 

Example defining directory to parse at program start:

<b>
node server.js  -d /home/dave/cluster   <fully defined directory / path>
</b> 


Example defining directory and port:

<b>
node server.js  -d /data/components -p 8000
</b> 

<br><br>

After starting the server a message will be shown indicating the port to be used when opening the browser.  

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/splash2.png)

Open a browser using the defined port:

<b>
http://localhost:4200 
</b> 

<br><br>


## Home screen:


(add home screen image)


ADD ALL THE OTHER INFORMATION FOR USER


## Maintainer

Dave Weilert

https://github.com/k8debug/vpk.git/ 

## License

Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall beincluded in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
