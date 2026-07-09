const word = document.querySelector(".changing-word");

if(word){

    const words=[
        "funnier.",
        "happier.",
        "better.",
        "cooler.",
        "freakier.",
        "sillier."
    ];

    let index=0;

    function changeWord(){

        word.animate([
            {
                transform:"translateY(0px) rotateX(0deg) scale(1)",
                opacity:1
            },
            {
                transform:"translateY(-35px) rotateX(90deg) scale(.92)",
                opacity:0
            }
        ],{
            duration:500,
            easing:"cubic-bezier(.87,0,.13,1)",
            fill:"forwards"
        });

        setTimeout(()=>{

            index=(index+1)%words.length;

            word.textContent=words[index];

            word.animate([
                {
                    transform:"translateY(35px) rotateX(-90deg) scale(.92)",
                    opacity:0
                },
                {
                    transform:"translateY(0) rotateX(0) scale(1)",
                    opacity:1
                }
            ],{
                duration:500,
                easing:"cubic-bezier(.87,0,.13,1)",
                fill:"forwards"
            });

        },500);

    }

    setInterval(changeWord,3000);

}