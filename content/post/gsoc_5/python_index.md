<h2>What did you do this week?</h2>

<h3>
   <a href='https://github.com/fury-gl/fury/pull/427'>
       fury-gl/fury PR#437: WebRTC streaming system for FURY 
   </a>
</h3>
<ul>
    <li>
        Before the 
         <a href='https://github.com/fury-gl/fury/pull/437/commits/8c670c284368029cdb5b54c178a792ec615e4d4d'>
            8c670c2
        </a>  commit, for some versions of MacOs the streaming system was
        falling in a silent bug. I’ve spent a lot of time researching to find a
        cause for this. Fortunately, I could found the cause and the solution.
        This troublesome MacOs was falling in a silent bug  because the
        SharedMemory Object was creating a memory resource with at least 4086
        bytes indepedent if I've requested less than that. If we look into the 
        MultiDimensionalBuffer Object (stream/tools.py) before the  8c670c2 
        commit we can see that Object has max_size parameter which needs to be updated
        if the SharedMemory was created with a "wrong" size.
    </li>
</ul>


<h3>
   <a href='https://github.com/fury-gl/helios/pull/1'>
       fury-gl/helios PR 1:  Network Layout and SuperActors 
   </a>
</h3>
<p>
    In the past week I've made a lot of improvements in this PR, 
    from performance improvements
    to visual effects. Bellow are the list of the tasks
    related with this PR:
</p>
<ul>
    <li>
        - Code refactoring.
    </li>
    <li>
        - Visual improvements: Using the UniformTools from my pull request 
        <a href='https://github.com/fury-gl/fury/pull/424'>#424</a> now is 
        possible to control all the  visual characteristics at runtime.
    </li>
    <li>
        - 2D Layout: Meanwhile 3d network representations are very usefully for 
        exploring a dataset is hard to convice a group of network scientists to use a visualization 
        system which dosen't allow 2d representations. Because of that I started 
        to coding the 2d behavior in the network visualization system.
    </li>
    <li>
      - Minimum Distortion Embeddings examples: I've created some examples 
        which shows how integrate pymde (Python Minimum Distortion Embeddings) with 
        fury/helios. The image bellow shows how the result of this integration: a "perfect" graph embedding
    </li>
</ul>      
<img src='https://user-images.githubusercontent.com/6979335/124524052-da937e00-ddcf-11eb-83ca-9b58ca692c2e.png'/>


<h2>
    What is coming up next week?
</h2>
<p>
    I'll probably focus on the 
    <a href=''>heliosPR#1</a>. Specifically, 
    writing tests and improving the minimum distortion
    embedding layout. 
</p>

<h2>
    Did you get stuck anywhere?
</h2>
I did not get stuck this week.
