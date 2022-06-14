<div id="top"></div>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<br />
<div align="center">

  [![Forks][forks-shield]][forks-url]
  [![Stargazers][stars-shield]][stars-url]
  [![Issues][issues-shield]][issues-url]
  [![Contributors][contributors-shield]][contributors-url]
  [![LinkedIn][linkedin-shield]][linkedin-url]

  <a href="https://nodejavascript.com?ref=githubLogo">
    <img src="https://avatars.githubusercontent.com/u/105805523?v=4" alt="Logo" width="80" height="80">
    <br />
    nodejavascript.com
  </a>

<!-- line feeds break list of a tags below -->
<h3 align="center">inputresponse-alpha-api</h3>
  <p align="center">
    Apollo GraphQL Neural Network Engine
    <br />
    <br />
    <a href="https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/index.js"><strong>Explore the code »</strong></a>
    <br />
    <br />
    <a href="https://nodejavascript.com/demo-coming-soon">DEMO</a>
    ·
    <a href="https://github.com/nodejavascript/inputresponse-alpha-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/nodejavascript/inputresponse-alpha-api/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
This GraphQL API is used to train neural networks and switftly respond to client inference-requests thereby providing easy access to AI with the benefits of graph reporting.

See client-side [inputresponse-alpha-client](https://github.com/nodejavascript/inputresponse-alpha-client) to enable or archive:

- [Neural Networks](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/resolvers/neuralnetwork.js)
  - neuralNetworks
  - neuralNetwork
  - neuralNetworkModel
  - insertNeuralNetwork
  - updateNeuralNetwork
  - requestNewApiKey


- [Memory](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/resolvers/memory.js)
  - memoryNeuralNetworksAdmin
  - memoryNeuralNetworks
  - trainNeuralNetwork


- [Clients](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/resolvers/samplingclient.js)
  - samplingClients
  - samplingClient
  - insertSamplingClient
  - updateSamplingClient


- [Models](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/resolvers/modelsample.js)
  - modelSamples
  - ModelSample
  - insertModelSample `apiKey is used`
  - updateModelSample

This project is under `active development`.

More about my insights will follow [my article](https://nodejavascript.com/a-neural-network-engine?ref=githubAbout).

### Built With

* [express](https://www.npmjs.com/package/express)
* [mongoose](https://npmjs.com/package/mongoose)
* [redis](https://npmjs.com/package/redis)
* [google-auth-library](https://npmjs.com/package/apollo/google-auth-library)
* [apollo-server-express](https://npmjs.com/package/apollo-server-express)
* [graphql](https://npmjs.com/package/graphql)
* [joi](https://npmjs.com/package/joi)
* [brain.js](https://npmjs.com/package/brain.js)
* [esm](https://npmjs.com/package/esm)
* [cors](https://npmjs.com/package/cors)
* [dayjs](https://npmjs.com/package/dayjs)

<!-- GETTING STARTED -->
## Getting Started
Use [NodeJS](https://github.com/nodejs) to run your own running API [inputresponse-alpha-api](https://github.com/nodejavascript/inputresponse-alpha-api)

[inputresponse-alpha-client](https://github.com/nodejavascript/inputresponse-alpha-client) was developed as an open-source utility for its project and uses Google Auth [here](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/components/Login.js#L13), [here](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/models/Auth.js#L10) and [here](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/logic/googleauth.js#L5) to [verify](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/src/logic/authentication.js#L13) some API requests.

This project is not stripped of:
- legacy code nor seemingly deprecated code that remains commented
- code that seems strange but there is a future reason for it
- hard coded routing key/values in this client that will be removed when the data can be requested from the `API` instead.

### Prerequisites
An entity that likes to blend GraphQL with ML and AI

### Installation
1. Run locally
   ```sh
   npm i && npm start
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are welcome.

<!-- LICENSE -->
## License

See [LICENSE](https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/LICENSE) for more information.

<!-- CONTACT -->
## Contact
* Home - [nodejavascript.com](https://nodejavascript.com?ref=githubContact)
* YouTube - [nodejavascript](https://www.youtube.com/channel/UCZFJHjd0c79xyj2SpB8UbJg)
* Twitter - [@nodejavascript](https://twitter.com/nodejavascript)
* LinkedIn - [@nodejavascript](https://linkedin.com/in/georgefielder)
* Email - [github@nodejavascript.com](mailto:github@nodejavascript.com)

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/nodejavascript/inputresponse-alpha-api.svg?style=plastic
[contributors-url]: https://github.com/nodejavascript/inputresponse-alpha-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nodejavascript/inputresponse-alpha-api.svg?style=plastic
[forks-url]: https://github.com/nodejavascript/inputresponse-alpha-api/network/members
[stars-shield]: https://img.shields.io/github/stars/nodejavascript/inputresponse-alpha-api.svg?style=plastic
[stars-url]: https://github.com/nodejavascript/inputresponse-alpha-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/nodejavascript/inputresponse-alpha-api.svg?style=plastic
[issues-url]: https://github.com/nodejavascript/inputresponse-alpha-api/issues
[license-shield]: https://img.shields.io/github/license/nodejavascript/inputresponse-alpha-api.svg?style=plastic
[license-url]: https://github.com/nodejavascript/inputresponse-alpha-api/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg??style=social&logo=appveyor
[linkedin-url]: https://linkedin.com/in/georgefielder
