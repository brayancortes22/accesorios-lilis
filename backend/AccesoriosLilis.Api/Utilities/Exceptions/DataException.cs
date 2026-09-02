namespace AccesoriosLilis.Api.Utilities.Exceptions;

public class DataException : Exception
{
    public DataException(string message) : base(message)
    {
    }

    public DataException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
