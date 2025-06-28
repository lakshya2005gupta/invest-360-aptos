import Typewriter from "typewriter-effect"


const TypeWritingEffect = () => {
  return (
    <div>
        <Typewriter
          options={{
            strings:[
                // "Fixed Deposit",
                // "Mutual Funds",
                // "Golds",
                // "Stocks",
                // "Recurring Deposits"
               '<span style="color: red;font-size: 64px; font-weight: bold;">Fixed Deposit</span>',
            '<span style="color: yellow;font-size: 64px; font-weight: bold;">Mutual Funds</span>',
             '<span style="color: red;font-size: 64px; font-weight: bold;">Golds</span>',
            '<span style="color: yellow;font-size: 64px; font-weight: bold;">Stocks</span>',
            '<span style="color: red;font-size: 64px; font-weight: bold;">Recurring Deposits</span>',
              
            ],
            autoStart:true,
            loop:true,
            deleteSpeed:50
          }}
        />
        
    </div>
  )
}

export default TypeWritingEffect