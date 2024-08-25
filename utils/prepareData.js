const  checkFromSQL = (num, block) => {

    if(num  >= block.highLevelMin  &&  num <= block.highLevelMax ) {
        return 3;

    }else if (num >= block.baseLevelMin && num <= block.baseLevelMax) {
        return 2;
    }else if (num <=block.lowLevelMax) {
        return 1
    }
}

module.exports = checkFromSQL