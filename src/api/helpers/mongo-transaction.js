const mongoose = require('mongoose');

/**
 * Run transactional queries
 * @param {Function} queries
 */
module.exports.MongoTransactionSession = async (queries) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let result;
    try {
        //Run transaction queries
        result = await queries(session);

        // commit the changes if result does not return error
        // else abort the transaction
        if(!result || !result.error)
            await session.commitTransaction();
        else
            await session.abortTransaction();

        session.endSession();
        return result;
    } catch (error) {
        // this will rollback any changes made in the database
        await session.abortTransaction();
        result = { error };
        session.endSession();

        if(error.codeName === 'WriteConflict')
            return await module.exports.MongoTransactionSession(queries);

        // rethrow the error
        throw error;
    }
}