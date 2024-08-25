const  checkFromSQL2 = (num, block) => {

    if(num  >= block.highLevelMin  &&  num <= block.highLevelMax ) {
        return 3;

    }else if (num == block.borderTwo) {
        return 2;
    }else if (num <= block.borderOne) {
        return 1
    }
}

module.exports = checkFromSQL2