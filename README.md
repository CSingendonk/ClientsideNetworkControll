# ALL RIGHTS RESERVED

> **As per GitHub**:  
> “However, without a license, the default copyright laws apply, meaning that
> you retain all rights to your source code and no one may reproduce, distribute,
> or create derivative works from your work.”

Proof-of-concept drafts can be found in my [whoops](https://github.com/CSingendonk/whoops)
and [htmlpanels](https://github.com/CSingendonk/htmlpanels) repositories as well.

---

## © 2024, 2025, 2026 - Chris Singendonk
Copyright (c) 2024  
All Rights Reserved.

This work is **NOT LICENSED** for public or private use, modification, distribution,
reproduction, or creation of derivative works **without explicit written approval
from the author**.

By default, **you may not use, modify, or distribute any part of this work** unless you have
received direct permission from the copyright holder.

> **Note**: Any API or code not defined within this project is assumed to be part of
> a standard web API, which is typically documented in official web development resources.
> The scripts rely on base web APIs, each subject to its respective owner’s copyright
> and/or licensing conditions.

``text
Any breach of contract, law, or other official restrictions, regulations, stipulations,
or other such legalities arising from the use of this work is entirely upon the user.
``

---

# ClientsideNetworkControll
A suite of client-side tools for monitoring, logging, and optionally blocking network traffic.

## core.js
- A single JavaScript IIFE that returns and initiates a purely client-side tool.
- Load the script in the desired browser scope to watch and manage network events.
- It **does** work in most major browsers and can be tested by running `core.js` in the DevTools console.
- Or include it directly:
``html
<script src="https://csingendonk.github.io/clientsidenetworkcontrol/core.js">
<!-- or wherever it is located (local/server-side) -->
</script>
``

## initLogs.js
- Logs and, if desired, blocks network traffic before completion.
- Offers extensive options for controlling **what**, **how**, **where**, **when**, and **if** logging occurs.
  - Visualize
  - Modify
  - Log
  - Step through
    - events
    - mutations
    - performance metrics
    - console output
    - and more
- Can run **without a network connection** (in special scenarios).
- The file is currently incomplete and broken. If you have questions, **reach out** for a detailed run-down.

[View core.js on GitHub](https://github.com/CSingendonk/ClientsideNetworkControl/blob/CSingendonk/core.js)  
[View initLogs.js on GitHub](https://github.com/CSingendonk/ClientsideNetworkControl/blob/CSingendonk/initLogs.js)

---

# ZERO DATA COLLECTION
### NO COOKIES, TRACKERS, OR DATA COLLECTION
- The script is fully static and can be used **offline**—though it can be served from anywhere.
- By default, **no data** is logged, stored, or transmitted to any external entity.
- You can disable local storage entirely, though logs will not persist between sessions or tabs.
- Optionally, you may set up remote syncing and exporting.

See [Release 1](https://github.com/CSingendonk/ClientsideNetworkControl/releases/tag/1) for a demo.

## BASE BLOCKING FUNCTIONALITY (< 5000 CHARS)
Includes XHR, BGSW, WS, HTTP.

![image](https://github.com/user-attachments/assets/9d16df45-5409-4de1-8e95-29c2e2a17d52)
![image](https://github.com/user-attachments/assets/4dd61563-3434-4ca1-b905-22a34652c43a)

---

## UI, CSS, HTML, AND JS MODULES IN ONE FILE
- Under 3000 lines total.

---

# HONORING COPYRIGHT & RESTRICTIONS IN COLLABORATIONS
Unauthorized usage, reproduction, modification, or distribution of this work, in whole or in part,
violates copyright law.

### Consider
A gardener has an apple tree and dreams of making apple pie, but pies have never been invented.  
The gardener, full of ideas, bakes apple cakes while sharing the pie concept with anyone who’ll listen.  
Someone takes the gardener’s apples, bakes pies, and claims ownership—eventually patenting the pies,  
altering the landscape and profiting off the gardener’s vision.

While pies multiply, the gardener is left with only a tree and the original idea—unable to fund or
develop the pie concept. This is about more than lost fruit; it’s about creative espionage, plagiarism,
and failing to attribute sources properly. In code and IP, failing to honor the original creator does
more than steal work; it stifles innovation. Future contributions are lost, and the adopting party is
limited by their own inability to conceive the idea.

When someone uses code without permission—claiming it as their own—or fails to credit the author, they
not only steal a product but also hamper future progress. The original creator loses the chance to
improve and contribute further. Meanwhile, the adopter lacks the creator’s insights that might help
them overcome roadblocks.

In the same way that the gardener’s vision for pies was lost without attribution, so too is progress
lost when a source isn’t credited. Proper attribution ensures creativity flourishes for everyone.

### Another View
You’ve spent countless hours designing and building a car. Collaboration is crucial, but others see
your blueprint, take it, and improve it behind closed doors, leaving you out. You never learn from
their enhancements, and they profit from your ideas while your own progress stalls.  
This is why **permission and attribution** matter: innovation is about **inclusion, shared learning,
and mutual respect**. Acknowledgment ensures those who plant the seeds of progress aren’t cast aside
while others harvest the fruits.

---

## CONTACT FOR APPROVAL
If you want to use, modify, or build upon this work, you **must first obtain explicit written
permission** from the author.  
Collaboration is welcome, provided mutual understanding and respect are upheld.

**Contact**: [https://github.com/csingendonk](https://github.com/csingendonk)

---

## LEGAL NOTICE
Any unauthorized use, reproduction, modification, or distribution of this or any other unlicensed work,
in whole or in part, is strictly prohibited and may result in legal action. By accessing or handling
this work, you acknowledge and agree to these terms.

**If in doubt—ask first.**

---

### OBSOLETE DRAFT
This is a draft copy of the complete code from a previous point in time and state.
